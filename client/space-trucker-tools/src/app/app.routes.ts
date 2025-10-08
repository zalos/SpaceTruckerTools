import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CargoManifestWriterComponent } from './pages/cargo-manifest-writer/cargo-manifest-writer.component';
import { WorkordersOverviewComponent } from './pages/workorders-overview/workorders-overview';
import { ProfitSplitterComponent } from './pages/profit-splitter/profit-splitter';
import { Yield2Sell } from './pages/yield-2-sell/yield-2-sell';
import { Scavenger } from './pages/scavenger/scavenger';
import { AaronsJumpDataComponent } from './pages/aarons-jump-data/aarons-jump-data';
import { ProfileComponent } from './pages/profile/profile';
import { ItemLookupComponent } from './pages/item-lookup/item-lookup';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cargo-manifest-writer', component: CargoManifestWriterComponent },
  { path: 'workorders-overview', component: WorkordersOverviewComponent },
  { path: 'profit-splitter', component: ProfitSplitterComponent },
  { path: 'yield-2-sell', component: Yield2Sell },
  { path: 'scavenger', component: Scavenger },
  { path: 'aarons-jump-data', component: AaronsJumpDataComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'item-lookup', component: ItemLookupComponent },
  { path: '**', redirectTo: '' }, // wildcard route for 404 page
];
