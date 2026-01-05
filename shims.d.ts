declare module 'download-git-repo' {
  function download(
    repo: string,
    dest: string,
    opts?: any,
    fn?: (err: Error | null) => void
  ): void;
  export = download;
}
