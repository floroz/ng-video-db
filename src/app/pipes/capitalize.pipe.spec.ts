import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizePipe();
    expect(pipe).toBeTruthy();
  });

  it('should capitalize strings', () => {
    const pipe = new CapitalizePipe();
    expect(pipe.transform('something')).toBe('Something');
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform('s')).toBe('S');
    expect(pipe.transform('sss')).toBe('Sss');
    expect(pipe.transform('ss')).toBe('Ss');
    expect(pipe.transform('least but not last')).toBe('Least But Not Last');
  });
});
