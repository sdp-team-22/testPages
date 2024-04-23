import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home';
import { UploadComponent } from './upload';
import { EditComponent } from './edit';
import { StatsComponent } from './stats';
// test search
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'edit', component: EditComponent },
  { path: 'stats', component: StatsComponent },
  // search
  { path: 'search', component: SearchComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
