import { defaultValueSchemable } from "sequelize/lib/utils";
import { DB_HOST,DB_NAME,DB_USER,DB_PASSWORD } from ".";

export default {
    "development":{
        "username":DB_USER,
        "password":DB_PASSWORD,
        "database":DB_NAME,
        "host":DB_HOST,
        "port": 3306,
        "dialect":"mysql"
    }
}