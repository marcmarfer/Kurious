alter table public.profiles
  add column avatar_color text
  check (
    avatar_color is null
    or avatar_color in ('forest', 'ochre', 'rust', 'olive', 'moss', 'pinhao', 'lagoon', 'plum')
  );
