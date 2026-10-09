import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmployeeSearchFilter, buildExactAccountFilter, isAdAccountEnabled, escapeLdapFilter } from '../src/integrations/activeDirectory/directorySearch.js';

test('escapes LDAP special characters', () => {
  assert.equal(escapeLdapFilter('ab*cd'), 'ab\\2acd');
  assert.equal(escapeLdapFilter('(ab)'), '\\28ab\\29');
});

test('builds an enabled-only search filter', () => {
  const filter = buildEmployeeSearchFilter('garcia');
  assert.ok(filter.includes('displayName=*garcia*'));
  assert.ok(filter.includes('sAMAccountName=*garcia*'));
  assert.ok(filter.includes('mail=*garcia*'));
  assert.ok(filter.includes('userAccountControl:1.2.840.113556.1.4.803:=2'));
});

test('rejects invalid search and exact account inputs', () => {
  assert.throws(() => buildEmployeeSearchFilter('a'));
  assert.throws(() => buildExactAccountFilter('(admin)'));
});

test('checks disabled bit independently of account type', () => {
  assert.equal(isAdAccountEnabled(512), true);
  assert.equal(isAdAccountEnabled(514), false);
  assert.equal(isAdAccountEnabled(undefined), false);
});
