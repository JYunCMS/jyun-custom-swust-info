export class BackEndApi {

  // Back End Host Address
  private static hostAddress = 'http://localhost:8080';

  // Public Address
  private static publicAddress = BackEndApi.hostAddress + '/public';

  // Public RESTful API
  static categories = BackEndApi.publicAddress + '/categories';
}
