#include "otelverse_robotics/otelverse_robotics.h"
#include <iostream>
#include <cassert>

int main() {
    std::cout << "Running test_instrumentation..." << std::endl;
    
    auto tracer = otelverse::robotics::Tracer::GetInstance();
    auto span = tracer->StartSpan("ros2.callback", {{"ros.topic", "/cmd_vel"}});
    
    std::map<std::string, std::string> headers;
    otelverse::robotics::InjectContextIntoMessage(headers, span);
    
    assert(headers["traceparent"] != "");
    std::cout << "traceparent injected: " << headers["traceparent"] << std::endl;
    
    auto extracted = otelverse::robotics::ExtractContextFromMessage(headers);
    assert(extracted["traceparent"] == headers["traceparent"]);
    
    span->End();
    delete span;
    
    std::cout << "test_instrumentation passed!" << std::endl;
    return 0;
}
