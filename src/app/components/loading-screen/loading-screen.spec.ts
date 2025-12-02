import { LoadingScreenComponent } from './loading-screen';

describe('LoadingScreenComponent', () => {
  it('should create', () => {
    const component = new LoadingScreenComponent();
    expect(component).toBeTruthy();
  });

  it('should display with isVisible true', () => {
    const component = new LoadingScreenComponent();
    component.isVisible = true;
    expect(component.isVisible).toBe(true);
  });

  it('should have default title and message', () => {
    const component = new LoadingScreenComponent();
    expect(component.title).toBe('Loading');
    expect(component.message).toBe('Please wait...');
  });

  it('should accept custom title and message', () => {
    const component = new LoadingScreenComponent();
    component.title = 'Redirecting';
    component.message = 'Setting up your password reset...';
    expect(component.title).toBe('Redirecting');
    expect(component.message).toBe('Setting up your password reset...');
  });
});
