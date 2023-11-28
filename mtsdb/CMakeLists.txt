cmake_minimum_required(VERSION 2.8.12)
project(mtsdb-worker "C")

if (POLICY CMP0042)
  cmake_policy(SET CMP0042 NEW)
endif()

set(PROJECT_INCLUDE_DIRS
       ${CMAKE_CURRENT_BINARY_DIR}
       ${CMAKE_CURRENT_SOURCE_DIR}
       /home/machbase/machbase_home/include
   )

set(PROJECT_LIBRARY_DIRS
       "/usr/local/lib/x86_64-linux-gnu/"
       "/home/machbase/machbase_home/lib"
       "/usr/local/lib"
   )

set(COMMON_SRCS
       log.h
       log.c
       config.h
       config.c
       decrypt.h
       decrypt.c
   )

set(PROJECT_LIBRARY_TARGET
       rabbitmq
       pthread
       machbasecli_dll
       cjson
       crypto
   )

set(EXECUTABLE_OUTPUT_PATH
       "/opt/bin"
   )

include_directories(${PROJECT_INCLUDE_DIRS})
link_directories(${PROJECT_LIBRARY_DIRS})
add_executable(mtsdb main.c work.c tsdb.c ${COMMON_SRCS})
target_link_libraries(mtsdb ${PROJECT_LIBRARY_TARGET})
