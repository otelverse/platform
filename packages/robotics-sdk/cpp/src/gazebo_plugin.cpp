#include "otelverse_robotics/otelverse_robotics.h"
#include <iostream>

// Mock Gazebo plugin
namespace gazebo {

class GazeboOtelPlugin {
public:
    void Load() {
        std::cout << "Loading Gazebo OpenTelemetry plugin..." << std::endl;
        auto tracer = otelverse::robotics::Tracer::GetInstance();
        auto span = tracer->StartSpan("gazebo.system.load", {{"service.name", "gazebo"}});
        span->SetAttribute("gazebo.version", "11.0");
        span->End();
        delete span;
    }
    
    void OnUpdate() {
        auto tracer = otelverse::robotics::Tracer::GetInstance();
        auto span = tracer->StartSpan("gazebo.physics.step", {{"service.name", "gazebo"}});
        span->End();
        delete span;
    }
};

} // namespace gazebo
