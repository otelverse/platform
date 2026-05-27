import { onLCP, onCLS, onFCP, onTTFB, onINP } from 'web-vitals';
export function trackWebVitals(meter) {
    const lcpHistogram = meter.createHistogram('webvitals.lcp', {
        description: 'Largest Contentful Paint',
        unit: 'ms',
    });
    const clsGauge = meter.createGauge('webvitals.cls', {
        description: 'Cumulative Layout Shift',
        unit: '1',
    });
    const fcpHistogram = meter.createHistogram('webvitals.fcp', {
        description: 'First Contentful Paint',
        unit: 'ms',
    });
    const ttfbHistogram = meter.createHistogram('webvitals.ttfb', {
        description: 'Time to First Byte',
        unit: 'ms',
    });
    const inpHistogram = meter.createHistogram('webvitals.inp', {
        description: 'Interaction to Next Paint',
        unit: 'ms',
    });
    onLCP((metric) => {
        lcpHistogram.record(metric.value);
    });
    onCLS((metric) => {
        clsGauge.record(metric.value);
    });
    onFCP((metric) => {
        fcpHistogram.record(metric.value);
    });
    onTTFB((metric) => {
        ttfbHistogram.record(metric.value);
    });
    onINP((metric) => {
        inpHistogram.record(metric.value);
    });
}
//# sourceMappingURL=vitals.js.map