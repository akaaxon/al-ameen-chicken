-- Loyalty points: customers (phone + password, no login), sessions, prizes, orders.
-- Run in the Supabase SQL editor (or `supabase db push`). Everything lives in the
-- `private` schema like products/categories and is only reachable with the service role.

-- ------------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------------
create table private.customers (
  id              uuid primary key default gen_random_uuid(),
  phone           text not null unique,            -- E.164, e.g. +96170123456
  name            text,
  password_hash   text not null,
  points          integer not null default 0 check (points >= 0),
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now()
);

-- The httpOnly cookie holds a random token; only its sha256 is stored here.
create table private.customer_sessions (
  token_hash  text primary key,
  customer_id uuid not null references private.customers(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index customer_sessions_customer_idx on private.customer_sessions(customer_id);

-- ------------------------------------------------------------------
-- PRIZES
-- ------------------------------------------------------------------
create type private.prize_type as enum (
  'free_item',         -- product_id required
  'free_delivery',
  'discount_percent',  -- discount_value = percent (0-100]
  'discount_fixed'     -- discount_value = amount in $
);

create table private.prizes (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  type            private.prize_type not null,
  points_required integer not null unique check (points_required > 0), -- no two prizes share a threshold
  product_id      uuid references private.products(id) on delete restrict,
  discount_value  numeric(10,2),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint prizes_shape check (
    (type = 'free_item'        and product_id is not null and discount_value is null) or
    (type = 'free_delivery'    and product_id is null     and discount_value is null) or
    (type = 'discount_percent' and product_id is null     and discount_value > 0 and discount_value <= 100) or
    (type = 'discount_fixed'   and product_id is null     and discount_value > 0)
  )
);

-- ------------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------------
create table private.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   bigint generated always as identity unique,
  customer_id    uuid not null references private.customers(id) on delete restrict,
  customer_name  text not null,
  phone          text not null,
  address        text not null,
  items          jsonb not null,   -- snapshot: [{product_id, name, price, quantity, reward?}]
  subtotal       numeric(10,2) not null,
  delivery_fee   numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  total          numeric(10,2) not null,
  prize_id       uuid references private.prizes(id) on delete set null,
  prize_snapshot jsonb,            -- the prize as it was when redeemed
  points_spent   integer not null default 0,
  points_earned  integer not null default 0,
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at     timestamptz not null default now()
);
create index orders_customer_idx on private.orders(customer_id, created_at desc);
create index orders_status_idx on private.orders(status, created_at desc);

-- ------------------------------------------------------------------
-- PLACE ORDER (atomic: prices from DB, prize check, points update)
-- ------------------------------------------------------------------
create or replace function private.place_order(
  p_customer_id     uuid,
  p_name            text,
  p_address         text,
  p_items           jsonb,    -- [{"product_id": uuid, "quantity": int}]
  p_prize_id        uuid,
  p_delivery_fee    numeric,
  p_points_per_unit numeric   -- points earned per $1 paid (excl. delivery)
) returns private.orders
language plpgsql
security definer
set search_path = private, public
as $$
declare
  v_customer  private.customers;
  v_prize     private.prizes;
  v_free      private.products;
  v_items     jsonb;
  v_subtotal  numeric(10,2);
  v_requested integer;
  v_found     integer;
  v_delivery  numeric(10,2) := p_delivery_fee;
  v_discount  numeric(10,2) := 0;
  v_spent     integer := 0;
  v_earned    integer;
  v_order     private.orders;
begin
  -- Lock the customer row so two concurrent orders can't spend the same points.
  select * into v_customer from private.customers where id = p_customer_id for update;
  if not found then raise exception 'customer_not_found'; end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) e
    where (e->>'quantity')::int is null or (e->>'quantity')::int not between 1 and 50
  ) then
    raise exception 'invalid_quantity';
  end if;

  with req as (
    select (e->>'product_id')::uuid as product_id, sum((e->>'quantity')::int) as quantity
    from jsonb_array_elements(p_items) e
    group by 1
  ),
  priced as (
    select p.id, p.name, p.price, r.quantity
    from req r
    join private.products p on p.id = r.product_id and p.is_available
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'product_id', id, 'name', name, 'price', price, 'quantity', quantity
    ) order by name), '[]'::jsonb),
    coalesce(sum(price * quantity), 0),
    count(*)
  into v_items, v_subtotal, v_found
  from priced;

  select count(distinct e->>'product_id') into v_requested from jsonb_array_elements(p_items) e;
  if v_found <> v_requested then raise exception 'item_unavailable'; end if;

  if p_prize_id is not null then
    select * into v_prize from private.prizes where id = p_prize_id and is_active;
    if not found then raise exception 'prize_unavailable'; end if;
    if v_customer.points < v_prize.points_required then raise exception 'not_enough_points'; end if;

    v_spent := v_prize.points_required;

    case v_prize.type
      when 'free_delivery' then
        v_delivery := 0;
      when 'discount_percent' then
        v_discount := round(v_subtotal * v_prize.discount_value / 100, 2);
      when 'discount_fixed' then
        v_discount := least(v_prize.discount_value, v_subtotal);
      when 'free_item' then
        select * into v_free from private.products where id = v_prize.product_id and is_available;
        if not found then raise exception 'prize_unavailable'; end if;
        v_items := v_items || jsonb_build_array(jsonb_build_object(
          'product_id', v_free.id, 'name', v_free.name, 'price', 0, 'quantity', 1, 'reward', true
        ));
    end case;
  end if;

  v_earned := floor((v_subtotal - v_discount) * p_points_per_unit);

  insert into private.orders (
    customer_id, customer_name, phone, address, items,
    subtotal, delivery_fee, discount, total,
    prize_id, prize_snapshot, points_spent, points_earned
  ) values (
    p_customer_id, p_name, v_customer.phone, p_address, v_items,
    v_subtotal, v_delivery, v_discount, v_subtotal - v_discount + v_delivery,
    v_prize.id, case when v_prize.id is null then null else to_jsonb(v_prize) end, v_spent, v_earned
  )
  returning * into v_order;

  update private.customers
  set points = points - v_spent + v_earned, name = p_name
  where id = p_customer_id;

  return v_order;
end;
$$;

revoke all on function private.place_order(uuid, text, text, jsonb, uuid, numeric, numeric) from public, anon, authenticated;
grant execute on function private.place_order(uuid, text, text, jsonb, uuid, numeric, numeric) to service_role;

revoke all on private.customers, private.customer_sessions, private.prizes, private.orders from anon, authenticated;
grant all on private.customers, private.customer_sessions, private.prizes, private.orders to service_role;
