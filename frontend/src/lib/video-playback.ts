// Coordination globale de lecture vidéo : garantit qu'une seule vidéo
// (ProfileCard, VideoPlayer, ...) joue à la fois dans toute l'application.
// Utile notamment côté recruteur, qui peut parcourir un catalogue de
// profils et déclencher plusieurs lectures vidéo successives.

let currentlyPlaying: HTMLVideoElement | null = null;

/**
 * À appeler dans le handler `onPlay` d'un élément <video>.
 * Met en pause la vidéo précédemment lancée si elle est différente.
 */
export function notifyVideoPlaying(video: HTMLVideoElement) {
  if (currentlyPlaying && currentlyPlaying !== video && !currentlyPlaying.paused) {
    currentlyPlaying.pause();
  }
  currentlyPlaying = video;
}

/**
 * À appeler dans le handler `onPause`/`onEnded` (et à l'unmount) pour
 * éviter de garder une référence vers une vidéo qui n'est plus active.
 */
export function clearVideoPlaying(video: HTMLVideoElement) {
  if (currentlyPlaying === video) {
    currentlyPlaying = null;
  }
}
