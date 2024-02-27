import { Component, ElementRef, ViewChild } from '@angular/core';
import { UploadService } from '../upload.service';

@Component({
    selector: 'upload-root',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
  })
export class UploadComponent {
  @ViewChild('hiddenInput')
  hiddenInput!: ElementRef;
  
  constructor(private service: UploadService) {}

  simulateInputClick() {
    console.log("input click simulated");
    this.hiddenInput.nativeElement.click();
  }

  uploadData() {
    console.log("upload data run");
    const formData = new FormData();
    const files: FileList = this.hiddenInput.nativeElement.files;
    console.log(files);

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }

    this.service.uploadData(formData).subscribe(response => {
      console.log('Upload successful:', response);
    }, error => {
      console.error('Error uploading files:', error);
    });
  }
}