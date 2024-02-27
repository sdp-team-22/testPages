import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home';
import { UploadComponent } from './upload';
import { EditComponent } from './edit';
import { ViewComponent } from './view';
import { StatsComponent } from './stats';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'edit', component: EditComponent },
  { path: 'view', component: ViewComponent },
  { path: 'stats', component: StatsComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
