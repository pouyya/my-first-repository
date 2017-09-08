import _ from 'lodash';
import {
  Http,
  BaseRequestOptions,
  Response,
  ResponseOptions,
  RequestMethod,
  XHRBackend,
  RequestOptions
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions, realBackend: XHRBackend) {
  // fake users from Database may be MSSQL DB
  let users: Array<any> = [
    {
      id: 1,
      username: 'rahil051',
      password: 'rahil123', // encrypted
      email: 'infernus.rk31@gmail.com',
      firstName: 'Rahil Khurshid',
      lastName: 'Ali',
      role: 'staff'
    },
    {
      id: 2,
      username: 'aria101',
      password: 'aria123', // encrypted
      email: 'aria.zanganeh@simple.com',
      firstName: 'Aria',
      lastName: 'Zanganeh',
      role: 'staff'
    },
    {
      id: 3,
      username: 'medi_hair',
      password: 'medi123', // encrypted
      email: 'medi.vali@simple.com',
      firstName: 'Medi',
      lastName: 'Vali',
      role: 'admin'
    }
  ];

  backend.connections.subscribe((connection: MockConnection) => {
    setTimeout(() => {
      // authenticate
      if (connection.request.url.endsWith('/api/authenticate') && connection.request.method === RequestMethod.Post) {
        let params = JSON.parse(connection.request.getBody());
        let filteredUsers = users.filter(user => {
          return user.email === params.email && user.password === params.password;
        });

        if (filteredUsers.length > 0) {
          let user = filteredUsers[0];
          connection.mockRespond(new Response(new ResponseOptions({
            status: 200,
            body: {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              token: 'fake-jwt-token'
            }
          })));
        } else {
          connection.mockError(new Error('Username or password is incorrect'));
        }

        return;
      }

      // get user by id
      if (connection.request.url.match(/\/api\/users\/\d+$/) && connection.request.method === RequestMethod.Get) {
        if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          let urlParts = connection.request.url.split('/');
          let id = parseInt(urlParts[urlParts.length - 1]);
          let matchedUsers = users.filter(user => { return user.id === id; });
          let user = matchedUsers.length ? matchedUsers[0] : null;
          connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: user })));
        } else {
          connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
        }

        return;
      }

      // check for valid email
      if(connection.request.url.endsWith('/api/checkForValidEmail') && connection.request.method === RequestMethod.Post) {
        let params = JSON.parse(connection.request.getBody());
        let found = _.find(users, { email: params.email });
        if(found) {
          connection.mockRespond(new Response(new ResponseOptions({
            status: 200,
            body: {
              found: true
            }
          })));
        } else {
          connection.mockError(new Error('Can\'t find provided email in out system'));
        }
      }

      // pass through any requests not handled above
      let realHttp = new Http(realBackend, options);
      let requestOptions = new RequestOptions({
        method: connection.request.method,
        headers: connection.request.headers,
        body: connection.request.getBody(),
        url: connection.request.url,
        withCredentials: connection.request.withCredentials,
        responseType: connection.request.responseType
      });
      realHttp.request(connection.request.url, requestOptions)
        .subscribe((response: Response) => {
          connection.mockRespond(response);
        },
        (error: any) => {
          connection.mockError(error);
        });
    }, 1000);
  });

  return new Http(backend, options);
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: Http,
  useFactory: fakeBackendFactory,
  deps: [MockBackend, BaseRequestOptions, XHRBackend]
};