"use client";

import { useState } from "react";

const PROFILE_IMAGE_PATH = "/images/mike-ajijola-profile.jpg";

export function ProfilePortrait({
  size = "page",
}: {
  size?: "header" | "page";
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span
      className={`profile-portrait profile-portrait-${size}`}
      role="img"
      aria-label="Portrait of Mike Ajijola"
    >
      <span aria-hidden="true">MA</span>
      <img
        src={PROFILE_IMAGE_PATH}
        alt=""
        aria-hidden="true"
        className={loaded ? "is-loaded" : undefined}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
