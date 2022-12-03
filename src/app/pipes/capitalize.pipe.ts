import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  pure: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value.trim()) return value;

    if (value.length === 1) return value.toUpperCase();

    return value.at(0)?.toUpperCase() + value.slice(1);
  }
}
