import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home';
import { UploadComponent } from './upload';
import { EditComponent } from './edit';
import { ViewComponent } from './view';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StatsComponent } from './stats';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule if you're using HttpClient
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { TableComponent } from './table/table.component';
import { DataService } from './services/solubility-data.service';
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UploadComponent,
    EditComponent,
    // ViewComponent,
    StatsComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, 
    AppRoutingModule,
    NoopAnimationsModule,
    HttpClientModule,
    MatTableModule,
    MatTabsModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
