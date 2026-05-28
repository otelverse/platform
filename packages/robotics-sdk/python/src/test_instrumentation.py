import unittest
from robotics import OtelRobotNode, trace, tracer

class TestInstrumentation(unittest.TestCase):
    def test_node_initialization(self):
        node = OtelRobotNode("test_robot")
        self.assertEqual(node.node_name, "test_robot")

    def test_decorator(self):
        @trace("test.action")
        def perform_action():
            return "done"
            
        result = perform_action()
        self.assertEqual(result, "done")

    def test_context_manager(self):
        with tracer.start_as_current_span("manual.span") as span:
            span.set_attribute("key", "value")
            
if __name__ == '__main__':
    unittest.main()
