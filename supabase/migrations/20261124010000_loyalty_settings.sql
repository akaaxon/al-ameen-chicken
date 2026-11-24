-- Loyalty settings, edited from the CMS: how many dollars earn one point.
-- place_order now reads the rate itself instead of taking it as a parameter.

create table private.loyalty_settings (
  id                boolean primary key default true check (id), -- single row
  dollars_per_point numeric(10,2) not null default 1 check (dollars_per_point > 0),
  updated_at        timestamptz not null default now()
);
insert into private.loyalty_settings (id) values (true);

revoke all on private.loyalty_settings from anon, authenticated;
grant all on private.loyalty_settings to service_role;

drop function if exists private.place_order(uuid, text, text, jsonb, uuid, numeric, numeric);

create or replace function private.place_order(
  p_customer_id  uuid,
  p_name         text,
  p_address      text,
  p_items        jsonb,    -- [{"product_id": uuid, "quantity": int}]
  p_prize_id     uuid,
  p_delivery_fee numeric
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
  v_rate      numeric;
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

  select dollars_per_point into v_rate from private.loyalty_settings;
  v_earned := floor((v_subtotal - v_discount) / coalesce(v_rate, 1));

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

revoke all on function private.place_order(uuid, text, text, jsonb, uuid, numeric) from public, anon, authenticated;
grant execute on function private.place_order(uuid, text, text, jsonb, uuid, numeric) to service_role;
