import {Component, Injectable, Input, Output, EventEmitter} from '@angular/core';

// Name Service
export interface ReturnUrl { Url: String; Id: String; }
export interface ActiveSinInsignUpTab { ActiveTab: String; Email: String; }

export interface SingUpType { Type: String; Values: any; }

export interface CategoryId { Category_Id: String; Category_Name: any; }

export interface InviteRouting { CubeId: String; Other: String; }

@Injectable()
export class DataSharedVarServiceService {


  StoreSingUpType: SingUpType = { Type: '', Values : '' };
  StoreReturnUrl: ReturnUrl = { Url : '', Id : '' };
  StoreActiveSinInsignUpTab: ActiveSinInsignUpTab = { ActiveTab : '', Email : '' };
  StoreCategory_Id: CategoryId = { Category_Id : '', Category_Name : '' };
  StoreInviteRoute: InviteRouting = { CubeId : '', Other : '' };

  constructor() { }

  SetSingUpType(Type, Values = null) {this.StoreSingUpType.Type = Type; this.StoreSingUpType.Values = Values; }
  GetSingUpType() { return this.StoreSingUpType; }


  SetReturnUrl(Url, Id= null) {this.StoreReturnUrl.Url = Url; this.StoreReturnUrl.Id = Id; }
  GetReturnUrl() { return this.StoreReturnUrl; }


  SetActiveSinInsignUpTab(str, email= null) {this.StoreActiveSinInsignUpTab.ActiveTab = str; this.StoreActiveSinInsignUpTab.Email = email; }
  GetActiveSinInsignUpTab() { return this.StoreActiveSinInsignUpTab; }


  SetCategory_Id(Category_Id, Category_Name) {
    this.StoreCategory_Id.Category_Id = Category_Id; this.StoreCategory_Id.Category_Name = Category_Name; }
  GetCategory_Id() { return this.StoreCategory_Id; }


  SetInviteRoute(CubeId, Other= null) { this.StoreInviteRoute.CubeId = CubeId; this.StoreInviteRoute.Other = Other; }
  GetInviteRoute() { return this.StoreInviteRoute; }




}
