import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import * as spinner from 'ng-spin-kit/app/spinners'

// Must export the config
export const firebaseConfig = {
  apiKey: "AIzaSyD6bva4-l3pvjSIDBAuYWySIsmMbC_7mTI",
  authDomain: "artesa-152017.firebaseapp.com",
  databaseURL: "https://artesa-152017.firebaseio.com",
  storageBucket: "artesa-152017.appspot.com",
  messagingSenderId: "1020374440248"
};

@NgModule({
  declarations: [
    AppComponent,
    spinner.RotatingPlaneComponent,
    spinner.DoubleBounceComponent,
    spinner.WaveComponent,
    spinner.WanderingCubesComponent,
    spinner.PulseComponent,
    spinner.ChasingDotsComponent,
    spinner.CircleComponent,
    spinner.ThreeBounceComponent,
    spinner.CubeGridComponent,
    spinner.WordPressComponent,
    spinner.FadingCircleComponent,
    spinner.FoldingCubeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
