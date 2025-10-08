import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-lookup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-lookup.html',
  styleUrls: ['./item-lookup.scss'],
})
export class ItemLookupComponent {
  regolithResult = '';
  uexResult = '';

  async fetchRegolithProfile() {
    const regolithKey = localStorage.getItem('regolithKey');
    if (!regolithKey) {
      this.regolithResult =
        '<span class="error">No Regolith secret key found in localStorage</span>';
      return;
    }

    try {
      const response = await fetch('https://api.regolith.rocks', {
        method: 'POST',
        headers: {
          'x-api-key': regolithKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              profile {
                userId
                scName
                avatarUrl
                createdAt
                updatedAt
              }
            }
          `,
        }),
      });

      const data = await response.json();
      const profile = data?.data?.profile;
      if (!profile) {
        throw new Error('No profile found');
      }

      this.regolithResult = `
        <p><strong>SC Name:</strong> ${profile.scName}</p>
        <p><strong>User ID:</strong> ${profile.userId}</p>
        <p><strong>Created:</strong> ${new Date(profile.createdAt).toLocaleString()}</p>
        <p><strong>Updated:</strong> ${new Date(profile.updatedAt).toLocaleString()}</p>
        ${profile.avatarUrl ? `<img src="${profile.avatarUrl}" alt="Avatar">` : ''}
      `;
    } catch (error: any) {
      console.error(error);
      this.regolithResult = `<span class="error">Failed to fetch profile: ${error.message}</span>`;
    }
  }

  async fetchUEXItemPrices() {
    const uexKey = localStorage.getItem('uexKey');
    if (!uexKey) {
      this.uexResult = '<span class="error">No UEX secret key found in localStorage</span>';
      return;
    }

    try {
      const response = await fetch('https://uexcorp.space/api/item-prices', {
        headers: { Authorization: `Bearer ${uexKey}` },
      });
      const data = await response.json();
      this.uexResult = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error: any) {
      console.error(error);
      this.uexResult = `<span class="error">Failed to fetch UEX data: ${error.message}</span>`;
    }
  }
}
