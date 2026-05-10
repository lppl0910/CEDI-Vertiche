import {Router} from "express";

export default abstract class AbstractController{ // Que esta incompleto

    // Atributos de instancis
    private _router:Router;
    private _prefix:string;


    // Getters
    public get router():Router{
        return this._router;
    }

    public get prefix():string{
        return this._prefix;
    }

    // Constrcor
    protected constructor(_prefix:string){
        this._router = Router();
        this._prefix = _prefix;
        this.initRoutes();

    }
    protected abstract initRoutes(): void;

}