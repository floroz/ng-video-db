import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  pure: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value.trim()) return value;

    return value
      .trim()
      .split(' ')
      .map((word) => {
        if (word.length === 1) return word.toUpperCase();

        return word.at(0)?.toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}
