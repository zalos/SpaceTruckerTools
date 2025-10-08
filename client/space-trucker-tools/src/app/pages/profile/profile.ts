import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  orgname: string;
  orgurl: string;
  orgimage: string;
  username: string;
  userimage: string;
  userdesc: string;
  regolithKey: string;
  uexKey: string;
  otherdata: string;
}

interface Webhook {
  name: string;
  url: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent implements OnInit {
  profile: UserProfile = {
    orgname: '',
    orgurl: '',
    orgimage: '',
    username: '',
    userimage: '',
    userdesc: '',
    regolithKey: '',
    uexKey: '',
    otherdata: '',
  };

  webhooks: Webhook[] = [];
  newWebhook: Webhook = { name: '', url: '' };
  importJson = '';
  showProfileView = false;

  ngOnInit() {
    this.loadProfile();
  }

  saveProfile() {
    try {
      // Validate JSON format if provided
      if (this.profile.otherdata.trim()) {
        JSON.parse(this.profile.otherdata);
      }

      // Save to localStorage
      const profileData = {
        ...this.profile,
        webhooks: this.webhooks,
      };

      localStorage.setItem('userProfile', JSON.stringify(profileData));

      // Also save to cookies for compatibility
      this.saveToCookies();

      alert('Profile saved successfully!');
      this.showProfileView = true;
    } catch (error) {
      alert('Error: Invalid JSON format in Additional Data field');
    }
  }

  loadProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        this.profile = { ...this.profile, ...profileData };
        this.webhooks = profileData.webhooks || [];
        this.showProfileView = true;
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    } else {
      // Try loading from cookies if localStorage is empty
      this.loadFromCookies();
    }
  }

  clearProfile() {
    if (confirm('Are you sure you want to clear all profile data?')) {
      this.profile = {
        orgname: '',
        orgurl: '',
        orgimage: '',
        username: '',
        userimage: '',
        userdesc: '',
        regolithKey: '',
        uexKey: '',
        otherdata: '',
      };
      this.webhooks = [];
      this.showProfileView = false;

      localStorage.removeItem('userProfile');
      this.clearCookies();

      alert('Profile cleared successfully!');
    }
  }

  exportProfile() {
    const profileData = {
      ...this.profile,
      webhooks: this.webhooks,
    };

    const jsonString = JSON.stringify(profileData, null, 2);

    // Create downloadable file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importProfile() {
    if (!this.importJson.trim()) {
      alert('Please paste JSON data to import');
      return;
    }

    try {
      const profileData = JSON.parse(this.importJson);

      // Validate required fields exist
      if (typeof profileData === 'object') {
        this.profile = { ...this.profile, ...profileData };
        this.webhooks = profileData.webhooks || [];
        this.saveProfile();
        this.importJson = '';
        alert('Profile imported successfully!');
      } else {
        throw new Error('Invalid profile format');
      }
    } catch (error) {
      alert('Error: Invalid JSON format. Please check your input.');
    }
  }

  addWebhook() {
    if (!this.newWebhook.name.trim() || !this.newWebhook.url.trim()) {
      alert('Please enter both webhook name and URL');
      return;
    }

    if (!this.isValidUrl(this.newWebhook.url)) {
      alert('Please enter a valid webhook URL');
      return;
    }

    this.webhooks.push({ ...this.newWebhook });
    this.newWebhook = { name: '', url: '' };
  }

  removeWebhook(index: number) {
    if (confirm('Are you sure you want to remove this webhook?')) {
      this.webhooks.splice(index, 1);
    }
  }

  obscureKey(key: string): string {
    if (!key) return 'Not set';
    return key.length > 8
      ? key.substring(0, 4) + '•••••••' + key.substring(key.length - 4)
      : '•••••••';
  }

  formatJsonData(jsonString: string): string {
    if (!jsonString.trim()) return 'None';
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private saveToCookies() {
    const profileData = {
      ...this.profile,
      webhooks: this.webhooks,
    };

    // Set cookie with 1 year expiration
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `userProfile=${encodeURIComponent(
      JSON.stringify(profileData)
    )}; expires=${expires.toUTCString()}; path=/`;
  }

  private loadFromCookies() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.split('=').map((c) => c.trim());
      if (name === 'userProfile') {
        try {
          const profileData = JSON.parse(decodeURIComponent(value));
          this.profile = { ...this.profile, ...profileData };
          this.webhooks = profileData.webhooks || [];
          this.showProfileView = true;
        } catch (error) {
          console.error('Error loading profile from cookies:', error);
        }
        break;
      }
    }
  }

  private clearCookies() {
    document.cookie = 'userProfile=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
