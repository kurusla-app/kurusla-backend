import { describe, it, expect, afterEach } from 'vitest';
import { isAgeSaSimulationMode } from '../src/utils/ageSaSimulation';

describe('isAgeSaSimulationMode', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('AGESA_API_URL yoksa simülasyon', () => {
    delete process.env.AGESA_API_URL;
    delete process.env.AGESA_SIMULATE;
    expect(isAgeSaSimulationMode()).toBe(true);
  });

  it('api-sim URL ile simülasyon', () => {
    process.env.AGESA_API_URL = 'https://api-sim.agesa.com.tr/v1';
    expect(isAgeSaSimulationMode()).toBe(true);
  });

  it('AGESA_SIMULATE=true ile simülasyon', () => {
    process.env.AGESA_API_URL = 'https://api.prod.agesa.com.tr/v1';
    process.env.AGESA_SIMULATE = 'true';
    expect(isAgeSaSimulationMode()).toBe(true);
  });

  it('gerçek URL ve simulate kapalıysa false', () => {
    process.env.AGESA_API_URL = 'https://api.prod.agesa.com.tr/v1';
    process.env.AGESA_SIMULATE = 'false';
    expect(isAgeSaSimulationMode()).toBe(false);
  });
});
