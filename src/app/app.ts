import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Login} from './login/login';
import {TopBar} from './top-bar/top-bar';
import {SignUp} from './sign-up/sign-up';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Login, TopBar, SignUp],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected title = 'talent-finder';
}
