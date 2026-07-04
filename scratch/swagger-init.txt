
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api/v1/auth/login": {
        "post": {
          "operationId": "AuthController_userLogin",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/users/admin/all": {
        "get": {
          "operationId": "UsersController_getAllAdmins",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN",
          "tags": [
            "Users"
          ]
        }
      },
      "/api/v1/users/admin": {
        "post": {
          "operationId": "UsersController_createAdmin",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateAdminDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Users"
          ]
        }
      },
      "/api/v1/students/my/groups": {
        "get": {
          "operationId": "StudentsController_getMyGroups",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "STUDENT",
          "tags": [
            "Students"
          ]
        }
      },
      "/api/v1/students": {
        "get": {
          "operationId": "StudentsController_getAllStudents",
          "parameters": [
            {
              "name": "page",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "limit",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Students"
          ]
        },
        "post": {
          "description": "Bu endpointga admin va superadmin huquqi bor",
          "operationId": "StudentsController_createStudent",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "full_name": {
                      "type": "string",
                      "example": "Alish"
                    },
                    "email": {
                      "type": "string"
                    },
                    "password": {
                      "type": "string"
                    },
                    "phone": {
                      "type": "string"
                    },
                    "photo": {
                      "type": "string",
                      "format": "binary"
                    },
                    "address": {
                      "type": "string"
                    },
                    "birth_date": {
                      "type": "string",
                      "format": "date",
                      "example": "2000-01-01"
                    },
                    "groups": {
                      "type": "array",
                      "items": {
                        "type": "number"
                      },
                      "example": [
                        1,
                        2,
                        3
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Students"
          ]
        }
      },
      "/api/v1/students/archive": {
        "get": {
          "operationId": "StudentsController_getArchiveStudents",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Students"
          ]
        }
      },
      "/api/v1/students/one/{id}": {
        "get": {
          "operationId": "StudentsController_getOneStudent",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Students"
          ]
        }
      },
      "/api/v1/students/homeworkAnswer/{homeworkId}": {
        "post": {
          "operationId": "StudentsController_createHomeworkAnswer",
          "parameters": [
            {
              "name": "homeworkId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "example": "Homework Answer"
                    },
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "STUDENT",
          "tags": [
            "Students"
          ]
        }
      },
      "/api/v1/students/{id}": {
        "delete": {
          "operationId": "StudentsController_deleteStudent",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Students"
          ]
        },
        "patch": {
          "operationId": "StudentsController_updateStudent",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateStudentDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Students"
          ]
        }
      },
      "/api/v1/teachers": {
        "get": {
          "operationId": "TeachersController_getAllTeachers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Teachers"
          ]
        },
        "post": {
          "description": "Bu endpointga admin va superadmin huquqi bor",
          "operationId": "TeachersController_createTeacher",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "full_name": {
                      "type": "string",
                      "example": "Alish"
                    },
                    "email": {
                      "type": "string"
                    },
                    "password": {
                      "type": "string"
                    },
                    "phone": {
                      "type": "string"
                    },
                    "photo": {
                      "type": "string",
                      "format": "binary"
                    },
                    "address": {
                      "type": "string"
                    },
                    "groups": {
                      "type": "array",
                      "items": {
                        "type": "number"
                      },
                      "example": [
                        1,
                        2,
                        3
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Teachers"
          ]
        }
      },
      "/api/v1/teachers/archive": {
        "get": {
          "operationId": "TeachersController_getArchiveTeachers",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Teachers"
          ]
        }
      },
      "/api/v1/teachers/one/{id}": {
        "get": {
          "operationId": "TeachersController_getOneTeacher",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Teachers"
          ]
        }
      },
      "/api/v1/teachers/{id}": {
        "delete": {
          "operationId": "TeachersController_deleteTeacher",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Teachers"
          ]
        },
        "patch": {
          "operationId": "TeachersController_updateTeacher",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateTeacherDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Teachers"
          ]
        }
      },
      "/api/v1/courses": {
        "get": {
          "operationId": "CoursesController_getAllCourses",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Courses"
          ]
        },
        "post": {
          "operationId": "CoursesController_createCourse",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCourseDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Courses"
          ]
        }
      },
      "/api/v1/courses/archive": {
        "get": {
          "operationId": "CoursesController_getArchiveCourses",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Courses"
          ]
        }
      },
      "/api/v1/courses/one/{id}": {
        "get": {
          "operationId": "CoursesController_getOneCourse",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Courses"
          ]
        }
      },
      "/api/v1/courses/{id}": {
        "delete": {
          "operationId": "CoursesController_deleteCourse",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Courses"
          ]
        },
        "patch": {
          "operationId": "CoursesController_updateCourse",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCourseDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Courses"
          ]
        }
      },
      "/api/v1/groups/one/students/{groupId}": {
        "get": {
          "operationId": "GroupsController_getGroupOne",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/archive": {
        "get": {
          "operationId": "GroupsController_getArchiveGroups",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/one/{id}": {
        "get": {
          "operationId": "GroupsController_getOneGroup",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/all": {
        "get": {
          "operationId": "GroupsController_getAllGroups",
          "parameters": [
            {
              "name": "groupName",
              "required": false,
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "max_student",
              "required": false,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups": {
        "post": {
          "operationId": "GroupsController_createGroup",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateGroupDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/{groupId}/schedules": {
        "get": {
          "operationId": "GroupsController_getSchedules",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/{groupId}/lesson": {
        "post": {
          "operationId": "GroupsController_createLesson",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLessonDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Groups"
          ]
        },
        "get": {
          "operationId": "GroupsController_getLessonByDate",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "date",
              "required": true,
              "in": "query",
              "schema": {
                "example": "2026-05-12",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/{groupId}": {
        "get": {
          "operationId": "GroupsController_getGroupById",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/groups/{id}": {
        "delete": {
          "operationId": "GroupsController_deleteGroup",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "tags": [
            "Groups"
          ]
        },
        "patch": {
          "operationId": "GroupsController_updateGroup",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateGroupDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Groups"
          ]
        }
      },
      "/api/v1/student-group/all": {
        "get": {
          "operationId": "StudentGroupController_getAllStudentGroup",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "StudentGroup"
          ]
        }
      },
      "/api/v1/student-group": {
        "post": {
          "operationId": "StudentGroupController_createStudentGroup",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateStudentGroupDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "StudentGroup"
          ]
        }
      },
      "/api/v1/rooms": {
        "get": {
          "operationId": "RoomsController_getAllRooms",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Rooms"
          ]
        },
        "post": {
          "operationId": "RoomsController_createRoom",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRoomDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Rooms"
          ]
        }
      },
      "/api/v1/rooms/arxive": {
        "get": {
          "operationId": "RoomsController_getArchiveRooms",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Rooms"
          ]
        }
      },
      "/api/v1/rooms/one/{id}": {
        "get": {
          "operationId": "RoomsController_getOneRoom",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Rooms"
          ]
        }
      },
      "/api/v1/rooms/{id}": {
        "delete": {
          "operationId": "RoomsController_deleteRoom",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Rooms"
          ]
        },
        "patch": {
          "operationId": "RoomsController_updateRoom",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateRoomDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Rooms"
          ]
        }
      },
      "/api/v1/lessons/my/group/{groupId}": {
        "get": {
          "operationId": "LessonsController_getMyGroupLessons",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "STUDENT,TEACHER,ADMIN,SUPERADMIN",
          "tags": [
            "Lessons"
          ]
        }
      },
      "/api/v1/lessons": {
        "get": {
          "operationId": "LessonsController_getAllLessons",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "ADMIN",
          "tags": [
            "Lessons"
          ]
        },
        "post": {
          "operationId": "LessonsController_createLesson",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLessonDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "ADMIN, TEACHER",
          "tags": [
            "Lessons"
          ]
        }
      },
      "/api/v1/attendance/all": {
        "get": {
          "operationId": "AttendanceController_getAllAttendance",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Attendance"
          ]
        }
      },
      "/api/v1/attendance": {
        "post": {
          "operationId": "AttendanceController_createAttendance",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateAttendanceDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Attendance"
          ]
        }
      },
      "/api/v1/homework/own/{lessonId}": {
        "get": {
          "operationId": "HomeworkController_getOwnHomework",
          "parameters": [
            {
              "name": "lessonId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "STUDENT",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/group/{groupId}/homework/{homeworkId}/results": {
        "get": {
          "operationId": "HomeworkController_getHomeworkResults",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "homeworkId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "status",
              "required": false,
              "in": "query",
              "schema": {
                "enum": [
                  "ACCEPTED",
                  "REJECTED",
                  "PENDING",
                  "CHECKED"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/group/{groupId}/homework/{homeworkId}/result/{studentId}": {
        "get": {
          "operationId": "HomeworkController_getGroupHomeworkStudentResult",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "homeworkId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "studentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/homework/all": {
        "get": {
          "operationId": "HomeworkController_getAllHomework",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/homework/{groupId}": {
        "get": {
          "operationId": "HomeworkController_getGroupHomework",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "ADMIN, TEACHER, SUPERADMIN",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/homework": {
        "post": {
          "operationId": "HomeworkController_createHomework",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "lesson_id": {
                      "type": "number"
                    },
                    "group_id": {
                      "type": "number"
                    },
                    "file": {
                      "type": "string",
                      "format": "binary"
                    },
                    "title": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/group/{groupId}/homework/{homeworkId}/check": {
        "post": {
          "operationId": "HomeworkController_submitHomeworkResult",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "homeworkId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HomeworkResultDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "SUPERADMIN, ADMIN, TEACHER",
          "tags": [
            "Homework"
          ]
        }
      },
      "/api/v1/files/{groupId}": {
        "get": {
          "operationId": "FilesController_getFiles",
          "parameters": [
            {
              "name": "groupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "ADMIN, TEACHER, SUPERADMIN",
          "tags": [
            "Files"
          ]
        }
      },
      "/api/v1/files/group/{grupId}/upload": {
        "post": {
          "operationId": "FilesController_uploadFile",
          "parameters": [
            {
              "name": "grupId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "lessonId",
              "required": true,
              "in": "query",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "security": [
            {
              "bearer": []
            }
          ],
          "summary": "ADMIN, TEACHER, SUPERADMIN",
          "tags": [
            "Files"
          ]
        }
      }
    },
    "info": {
      "title": "CRM N26 group",
      "description": "",
      "version": "1.0.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "securitySchemes": {
        "bearer": {
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "type": "http"
        }
      },
      "schemas": {
        "LoginDto": {
          "type": "object",
          "properties": {
            "phone": {
              "type": "string",
              "example": "975661099"
            },
            "password": {
              "type": "string",
              "example": "Benazir99!"
            }
          },
          "required": [
            "phone",
            "password"
          ]
        },
        "CreateAdminDto": {
          "type": "object",
          "properties": {
            "first_name": {
              "type": "string"
            },
            "last_name": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "address": {
              "type": "string"
            }
          },
          "required": [
            "first_name",
            "last_name",
            "password",
            "phone",
            "email",
            "address"
          ]
        },
        "UpdateStudentDto": {
          "type": "object",
          "properties": {
            "full_name": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "birth_date": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "groups": {
              "example": [
                1,
                2,
                3
              ],
              "type": "array",
              "items": {
                "type": "number"
              }
            }
          }
        },
        "UpdateTeacherDto": {
          "type": "object",
          "properties": {
            "full_name": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "phone": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "address": {
              "type": "string"
            },
            "groups": {
              "example": [
                1,
                2,
                3
              ],
              "type": "array",
              "items": {
                "type": "number"
              }
            }
          }
        },
        "CreateCourseDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "price": {
              "type": "number"
            },
            "duration_month": {
              "type": "number"
            },
            "duration_hours": {
              "type": "number"
            }
          },
          "required": [
            "name",
            "description",
            "price",
            "duration_month",
            "duration_hours"
          ]
        },
        "UpdateCourseDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "price": {
              "type": "number"
            },
            "duration_month": {
              "type": "number"
            },
            "duration_hours": {
              "type": "number"
            }
          }
        },
        "CreateGroupDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "course_id": {
              "type": "number"
            },
            "teachers": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "students": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "room_id": {
              "type": "number"
            },
            "start_date": {
              "type": "string"
            },
            "week_day": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "MONDAY",
                  "TUESDAY",
                  "WEDNESDAY",
                  "THURSDAY",
                  "FRIDAY",
                  "SATURDAY",
                  "SUNDAY"
                ]
              }
            },
            "start_time": {
              "type": "string"
            },
            "max_student": {
              "type": "number"
            }
          },
          "required": [
            "name",
            "description",
            "course_id",
            "teachers",
            "students",
            "room_id",
            "start_date",
            "week_day",
            "start_time",
            "max_student"
          ]
        },
        "AttendanceItemDto": {
          "type": "object",
          "properties": {
            "student_id": {
              "type": "number"
            }
          },
          "required": [
            "student_id"
          ]
        },
        "CreateLessonDto": {
          "type": "object",
          "properties": {
            "group_id": {
              "type": "number"
            },
            "topic": {
              "type": "string"
            },
            "description": {
              "type": "string"
            }
          },
          "required": [
            "group_id",
            "topic"
          ]
        },
        "UpdateGroupDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "course_id": {
              "type": "number"
            },
            "teachers": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "students": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "room_id": {
              "type": "number"
            },
            "start_date": {
              "type": "string"
            },
            "week_day": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "MONDAY",
                  "TUESDAY",
                  "WEDNESDAY",
                  "THURSDAY",
                  "FRIDAY",
                  "SATURDAY",
                  "SUNDAY"
                ]
              }
            },
            "start_time": {
              "type": "string"
            },
            "max_student": {
              "type": "number"
            }
          }
        },
        "CreateStudentGroupDto": {
          "type": "object",
          "properties": {
            "student_id": {
              "type": "number"
            },
            "group_id": {
              "type": "number"
            }
          },
          "required": [
            "student_id",
            "group_id"
          ]
        },
        "CreateRoomDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "capacity": {
              "type": "number"
            }
          },
          "required": [
            "name",
            "capacity"
          ]
        },
        "UpdateRoomDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "capacity": {
              "type": "number"
            }
          }
        },
        "CreateAttendanceDto": {
          "type": "object",
          "properties": {
            "group_id": {
              "type": "number"
            },
            "student_id": {
              "type": "number"
            },
            "isPresent": {
              "type": "boolean"
            }
          },
          "required": [
            "group_id",
            "student_id",
            "isPresent"
          ]
        },
        "HomeworkResultDto": {
          "type": "object",
          "properties": {
            "grade": {
              "type": "number"
            },
            "title": {
              "type": "string"
            },
            "homework_answer_id": {
              "type": "number"
            }
          },
          "required": [
            "grade",
            "title",
            "homework_answer_id"
          ]
        }
      }
    }
  },
  "customOptions": {
    "persistAuthorization": true
  }
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
