import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  selectedFile: File | null = null;
  uploading = false;
  photoURL: string | null = null;

  constructor(public auth: AuthService) {
    this.loadPhoto();
  }

  async loadPhoto() {
    if (this.auth.currentUser) {
      this.photoURL = await this.auth.getProfilePhoto(this.auth.currentUser.uid);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only JPG/PNG allowed');
      return;
    }
    this.selectedFile = file;
  }

  async uploadPhoto() {
    if (!this.selectedFile) return alert('Choose a file first');
    this.uploading = true;

    try {
      this.photoURL = await this.auth.updateProfilePhoto(this.selectedFile);
      alert('Upload successful!');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      this.uploading = false;
    }
  }
}
