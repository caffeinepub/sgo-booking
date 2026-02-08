import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLocale } from '../../i18n/LocaleContext';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as 'en')}>
      <SelectTrigger className="w-[140px] h-9">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
}
