import {Routes} from '@angular/router';
import {Home} from './home/home';
import {Login} from './login/login';
import {SignUp} from './sign-up/sign-up';
import {BusinessService} from './business-service/business-service';
import {CreateBusinessService} from './create-business-service/create-business-service';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'login', component: Login},
  {path: 'sign-up', component: SignUp},
  {path: 'service/:id', component: BusinessService},
  {path: 'create', component: CreateBusinessService}
];
