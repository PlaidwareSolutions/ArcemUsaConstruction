{pkgs}: {
  deps = [
    pkgs.ffmpeg
    pkgs.lsof
    pkgs.imagemagick
    pkgs.postgresql
    pkgs.jq
  ];
}
