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
      url: "/user",
      result: (_request) => {
        const response = users;

        return APIFailureWrapper({
          content: response,
          errorMessage: "Erro ao listar usuários",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "get",
      url: "/user/:id",
      result: (request) => {
        const user = users.find((addr) => addr.id === parseInt(request.params.id));

        return APIFailureWrapper({
          content: user,
          errorMessage: "Erro ao listar endereço",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "post",
      url: "/user",
      result: (request) => {
        const body = JSON.parse(request.requestBody);

        const newUser: User = {
          id: users.length + 1,
          name: body.name,
          level: body.level as UserLevel,
          email: body.email,
          password: body.password,
        };

        users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;

        return APIFailureWrapper({
          content: userWithoutPassword,
          errorMessage: "Error ao criar usuário",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "put",
      url: "/user/:id",
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
            errorMessage: "Usuário não encontrado",
          });
        }

        const { password, ...userWithoutPassword } = editedUser;

        return APIFailureWrapper({
          content: userWithoutPassword,
          errorMessage: "Erro ao editar usuário",
        });
      },
    },
    "on"
  ),

  mockFlag(
    {
      method: "delete",
      url: "/user/:id",
      result: (request) => {
        let userToDelete: User | undefined;

        for (let index = 0; index < users.length; index++) {
          if (users[index].id === parseInt(request.params.id)) {
            userToDelete = users.splice(index, 1)[0];
            break;
          }
        }

        return APIFailureWrapper({
          content: userToDelete,
          errorMessage: "Erro ao deletar usuário",
        });
      },
    },
    "on"
  ),
];

export default userRoutes;
