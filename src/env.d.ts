interface ImportMetaEnv {
  readonly PRISMIC_REPOSITORY?: string;
  readonly PRISMIC_ACCESS_TOKEN?: string;
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
