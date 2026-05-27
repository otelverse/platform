#include "otelverse_robotics/otelverse_robotics.h"
#include <iostream>

namespace otelverse {
namespace robotics {

class MockSpan : public Span {
public:
    MockSpan(std::string name) : name_(name) {
        std::cout << "Starting span: " << name_ << std::endl;
    }
    void SetAttribute(const std::string& key, const std::string& value) override {
        std::cout << "Span " << name_ << " - Set attribute " << key << "=" << value << std::endl;
    }
    void End() override {
        std::cout << "Ending span: " << name_ << std::endl;
    }
private:
    std::string name_;
};

class MockTracer : public Tracer {
public:
    Span* StartSpan(const std::string& name, const std::map<std::string, std::string>& attributes) override {
        auto span = new MockSpan(name);
        for (const auto& kv : attributes) {
            span->SetAttribute(kv.first, kv.second);
        }
        return span;
    }
};

Tracer* Tracer::GetInstance() {
    static MockTracer tracer;
    return &tracer;
}

std::map<std::string, std::string> ExtractContextFromMessage(const std::map<std::string, std::string>& headers) {
    std::cout << "Extracting context from message headers" << std::endl;
    return headers;
}

void InjectContextIntoMessage(std::map<std::string, std::string>& headers, Span* span) {
    std::cout << "Injecting context into message headers" << std::endl;
    headers["traceparent"] = "00-mocktraceid-mockspanid-01";
}

} // namespace robotics
} // namespace otelverse
