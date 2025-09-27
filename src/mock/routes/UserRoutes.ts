import usersData from "@/mock/seeds/userSeeds.json";
import { APIFailureWrapper, mockFlag } from "../utils";
import type { User } from "@/mock/entities/User";
import type { UserLevel } from "@/mock/entities/UserLevel";

const users: User[] = usersData.map((user) => ({
  ...user,
  level: user.level as UserLevel,
}));

const userRoutes = [
  mockFlag(
    {
      method: "get",
      url: "/users",
      result: (_request) => {
        const response = users.map(({ password, ...user }) => user);

        return APIFailureWrapper({
          content: { items: response, total: response.length },
          errorMessage: "Error fetching users",
          failureRate: 10,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/users",
      result: (request) => {
        const body = JSON.parse(request.requestBody);

        if (users.find((u) => u.email === body.email)) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "Email already exists",
            specificError: { status: 400, message: "Email already registered" },
            failureRate: 100,
          });
        }

        const newUser: User = {
          id: Math.max(...users.map((u) => u.id), 0) + 1,
          name: body.name,
          level: body.level as UserLevel, // ✅ Conversão aqui
          email: body.email,
          password: body.password,
        };

        users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;

        return APIFailureWrapper({
          content: userWithoutPassword,
          errorMessage: "Error creating user",
          failureRate: 15,
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "put",
      url: "/users/:id",
      result: (request) => {
        const body = JSON.parse(request.requestBody);
        let editedUser: User | undefined;

        users.forEach((user) => {
          if (user.id === parseInt(request.params.id)) {
            editedUser = user;
            user.name = body.name || user.name;
            user.level = (body.level as UserLevel) || user.level;
            user.email = body.email || user.email;
            if (body.password) {
              user.password = body.password;
            }
          }
        });

        if (!editedUser) {
          return APIFailureWrapper({
            content: null,
            errorMessage: "User not found",
            specificError: { status: 404, message: "User not found" },
            failureRate: 5,
          });
        }

        const { password, ...userWithoutPassword } = editedUser;

        return APIFailureWrapper({
          content: userWithoutPassword,
          errorMessage: "Error updating user",
          failureRate: 15,
        });
      },
    },
    "on"
  ),
];

export default userRoutes;
