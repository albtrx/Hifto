-- Erst die alte Einschränkung entfernen, dann Daten migrieren, dann neue Einschränkung setzen
alter table public.requests drop constraint if exists requests_category_check;

update public.requests set category = 'sonstige-hilfe' where category in ('hilfe', 'sonstiges', 'freizeit');

alter table public.requests add constraint requests_category_check check (
  category in (
    'reparatur', 'zuhause', 'transport', 'reinigung', 'garten',
    'technik', 'lernen', 'tiere', 'events', 'sonstige-hilfe'
  )
);
