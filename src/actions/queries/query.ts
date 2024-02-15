import { UserRepo } from "../../repository/user/user.repo.js";

interface IQuery {}

interface IQueryHandler<Type> {
    execute(qry: IQuery): Promise<Type>
}

export {IQuery, IQueryHandler};