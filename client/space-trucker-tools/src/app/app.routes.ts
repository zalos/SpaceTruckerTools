import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CargoManifestWriter } from './pages/cargo-manifest-writer/cargo-manifest-writer';
import { WorkordersOverview } from './pages/workorders-overview/workorders-overview';
import { ProfitSplitter } from './pages/profit-splitter/profit-splitter';
import { Yield2Sell } from './pages/yield-2-sell/yield-2-sell';
import { Scavenger } from './pages/scavenger/scavenger';
import { AaronsJumpDataComponent } from './pages/aarons-jump-data/aarons-jump-data';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cargo-manifest-writer', component: CargoManifestWriter },
  { path: 'workorders-overview', component: WorkordersOverview },
  { path: 'profit-splitter', component: ProfitSplitter },
  { path: 'yield-2-sell', component: Yield2Sell },
  { path: 'scavenger', component: Scavenger },
  { path: 'aarons-jump-data', component: AaronsJumpDataComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }, // wildcard route for 404 page
];
