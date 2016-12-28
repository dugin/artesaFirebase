import { BeerFirebasePage } from './app.po';

describe('beer-firebase App', function() {
  let page: BeerFirebasePage;

  beforeEach(() => {
    page = new BeerFirebasePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
