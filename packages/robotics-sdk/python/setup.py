from setuptools import setup, Extension

# In a real setup, we would use pybind11 setup helpers:
# from pybind11.setup_helpers import Pybind11Extension, build_ext
# ext_modules = [Pybind11Extension("_otelverse_robotics", ["src/_otelverse_robotics.cpp"])]

setup(
    name="otelverse-robotics",
    version="0.16.0-dev",
    author="OTelVerse",
    description="Python observability SDK for Robotics",
    packages=["robotics"],
    package_dir={"": "src"},
    # ext_modules=ext_modules,
    # cmdclass={"build_ext": build_ext},
)
