import { describe, it } from 'vitest';
import assert from 'assert';
import resolveConfig from '../../../lib/helpers/resolveConfig.js';

describe('helpers::resolveConfig', () => {
  it('should ignore inherited nested auth fields', () => {
    Object.defineProperty(Object.prototype, 'username', {
      value: 'inherited-user',
      configurable: true,
    });
    Object.defineProperty(Object.prototype, 'password', {
      value: 'inherited-pass',
      configurable: true,
    });

    try {
      const config = resolveConfig({
        url: '/foo',
        auth: {},
      });

      assert.strictEqual(config.headers.get('Authorization'), 'Basic Og==');
    } finally {
      delete Object.prototype.username;
      delete Object.prototype.password;
    }
  });

  it('should ignore inherited nested serializer fields', () => {
    let serializeInvoked = false;
    let encodeInvoked = false;

    Object.defineProperty(Object.prototype, 'serialize', {
      value() {
        serializeInvoked = true;
        return 'inherited=1';
      },
      configurable: true,
    });
    Object.defineProperty(Object.prototype, 'encode', {
      value() {
        encodeInvoked = true;
        return 'inherited';
      },
      configurable: true,
    });

    try {
      const config = resolveConfig({
        url: '/foo',
        params: { value: 'a b' },
        paramsSerializer: {},
      });

      assert.strictEqual(config.url, '/foo?value=a+b');
      assert.strictEqual(serializeInvoked, false);
      assert.strictEqual(encodeInvoked, false);
    } finally {
      delete Object.prototype.serialize;
      delete Object.prototype.encode;
    }
  });
});
