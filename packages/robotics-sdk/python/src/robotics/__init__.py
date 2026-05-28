import functools

# Mock implementation of OpenTelemetry Tracer
class MockTracer:
    def start_as_current_span(self, name, attributes=None):
        class SpanContext:
            def __enter__(self):
                print(f"Starting span: {name}")
                return self
            def __exit__(self, exc_type, exc_val, exc_tb):
                print(f"Ending span: {name}")
            def set_attribute(self, key, value):
                print(f"Span attribute: {key}={value}")
        return SpanContext()

tracer = MockTracer()

def trace(name=None):
    """Manual instrumentation decorator"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            span_name = name or func.__name__
            with tracer.start_as_current_span(span_name):
                return func(*args, **kwargs)
        return wrapper
    return decorator

class OtelRobotNode:
    """Drop-in replacement for rclpy.node.Node with automatic instrumentation."""
    def __init__(self, node_name):
        self.node_name = node_name
        print(f"Initialized OtelRobotNode: {node_name}")
        with tracer.start_as_current_span("node.init", attributes={"node.name": node_name}):
            pass
            
    def create_timer(self, period, callback):
        @trace(name=f"timer_callback")
        def wrapped_callback():
            callback()
        print(f"Created instrumented timer")
        return wrapped_callback
