export interface Lesson {
  name: string;
  file?: File | string;  // может быть строкой (ссылкой) или объектом File
  fileName?: string;    // добавляем новое поле для хранения имени файла
}
