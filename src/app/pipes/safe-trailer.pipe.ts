import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeTrailer',
  standalone: true,
})
export class SafeTrailerPipe implements PipeTransform {
  #sanitizer = inject(DomSanitizer);

  transform(url: string | null | undefined): SafeResourceUrl | null {
    if (!url) return null;

    const embedUrl = this.#getEmbedUrl(url);
    if (!embedUrl) return null;

    return this.#sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  #getEmbedUrl(url: string): string | null {
    const youtubeId = this.#extractYoutubeId(url);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
    }

    const tiktokId = this.#extractTiktokId(url);
    if (tiktokId) {
      return `https://www.tiktok.com/embed/v2/${tiktokId}`;
    }

    return null;
  }

  #extractYoutubeId(url: string): string | null {
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
  }

  #extractTiktokId(url: string): string | null {
    const regex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
    return url.match(regex)?.[1] ?? null;
  }
}