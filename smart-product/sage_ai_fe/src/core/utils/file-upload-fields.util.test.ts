import { describe, expect,it } from 'vitest';

import { extractFilesFromFormData,getFileUploadFieldKeys } from './file-upload-fields.util';

describe('getFileUploadFieldKeys', () => {
  it('returns empty array if uiSchema is undefined', () => {
    expect(getFileUploadFieldKeys(undefined as any)).toEqual([]);
  });

  it('returns empty array if uiSchema is empty', () => {
    expect(getFileUploadFieldKeys({})).toEqual([]);
  });

  it('returns keys with customFile widget', () => {
    const uiSchema = {
      field1: { 'ui:widget': 'customFile' },
      field2: { 'ui:widget': 'customText' },
      field3: { 'ui:widget': 'customFile' },
    };
    expect(getFileUploadFieldKeys(uiSchema)).toEqual(['field1', 'field3']);
  });
});

describe('extractFilesFromFormData', () => {
  it('returns empty array if uiSchema is undefined', () => {
    expect(extractFilesFromFormData({}, undefined as any)).toEqual([]);
  });

  it('returns empty array if no file fields present', () => {
    const uiSchema = { field1: { 'ui:widget': 'customText' } };
    expect(extractFilesFromFormData({ field1: 'abc' }, uiSchema)).toEqual([]);
  });

  it('extracts single File object', () => {
    const file = new File(['foo'], 'foo.txt');
    const uiSchema = { fileField: { 'ui:widget': 'customFile' } };
    const formData = { fileField: file };
    expect(extractFilesFromFormData(formData, uiSchema)).toEqual([file]);
  });

  it('extracts multiple File objects from array', () => {
    const file1 = new File(['foo'], 'foo.txt');
    const file2 = new File(['bar'], 'bar.txt');
    const uiSchema = { fileField: { 'ui:widget': 'customFile' } };
    const formData = { fileField: [file1, file2] };
    expect(extractFilesFromFormData(formData, uiSchema)).toEqual([file1, file2]);
  });

  it('ignores non-File values in file fields', () => {
    const uiSchema = { fileField: { 'ui:widget': 'customFile' } };
    const formData = { fileField: 'notAFile' };
    expect(extractFilesFromFormData(formData, uiSchema)).toEqual([]);
  });
});
