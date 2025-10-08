import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Announcement {
  title: string;
  body: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private originalBackground: string = '';

  announcements: Announcement[] = [
    {
      title: 'Welcome!',
      body: 'This is a work in progress, make suggestions if you know me.',
    },
    {
      title: 'New Features Coming',
      body: 'Loading teams, importing manifests, and exporting to discord coming soon!',
    },
    {
      title: 'Did You Know?',
      body: 'You can now export your manifest as TXT or CSV.',
    },
  ];

  ngOnInit() {
    // Store original background and set home page background
    this.originalBackground = document.body.style.backgroundImage;
    document.body.style.backgroundImage = "url('/assets/SpacestationBackground.png')";
  }

  ngOnDestroy() {
    // Restore original background
    document.body.style.backgroundImage = this.originalBackground;
  }

  currentIndex = 0;

  get currentAnnouncement(): Announcement {
    return this.announcements[this.currentIndex];
  }

  nextAnnouncement(): void {
    this.currentIndex = (this.currentIndex + 1) % this.announcements.length;
  }

  prevAnnouncement(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.announcements.length) % this.announcements.length;
  }

  closeAnnouncement(): void {
    // TODO: Implement announcement close functionality
    const announcementBox = document.getElementById('announcementBox');
    if (announcementBox) {
      announcementBox.style.display = 'none';
    }
  }
}
