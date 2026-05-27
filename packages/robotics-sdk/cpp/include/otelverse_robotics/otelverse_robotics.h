#pragma once

#include <string>
#include <map>

// Mock implementation for ROS 2 and Gazebo observability
namespace otelverse {
namespace robotics {

// Span interface mock
class Span {
public:
    virtual ~Span() = default;
    virtual void SetAttribute(const std::string& key, const std::string& value) = 0;
    virtual void End() = 0;
};

// Tracer mock
class Tracer {
public:
    static Tracer* GetInstance();
    virtual Span* StartSpan(const std::string& name, const std::map<std::string, std::string>& attributes = {}) = 0;
};

// Context propagation
std::map<std::string, std::string> ExtractContextFromMessage(const std::map<std::string, std::string>& headers);
void InjectContextIntoMessage(std::map<std::string, std::string>& headers, Span* span);

} // namespace robotics
} // namespace otelverse
