import { FiltersLabelPipe } from './filters-label.pipe';

describe('FiltersLabelPipe', () => {
  it('create an instance', () => {
    const pipe = new FiltersLabelPipe();
    expect(pipe.transform('name')).toBe('Most name');
    expect(pipe.transform('-name')).toBe('Least name');
  });
});
