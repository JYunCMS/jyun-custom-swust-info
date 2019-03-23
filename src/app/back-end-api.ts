export class BackEndApi {

  // Back End Host Address
  static hostAddress = 'http://localhost:8080';

  // Public Address
  private static publicInterface = BackEndApi.hostAddress + '/public';

  // Public RESTful API
  static categories = BackEndApi.publicInterface + '/categories';
  static articlesByCategory = BackEndApi.publicInterface + '/articles-by-category';
  static articleById = BackEndApi.publicInterface + '/article-by-id';
}
