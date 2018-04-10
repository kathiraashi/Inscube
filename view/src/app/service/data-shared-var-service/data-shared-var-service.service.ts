import {Component, Injectable, Input, Output, EventEmitter} from '@angular/core';

// Name Service
export interface ReturnUrl { Url: String; Id: String; }
export interface ActiveSinInsignUpTab { ActiveTab: String; Email: String; }

export interface SingUpType { Type: String; Values: any; }

export interface CategoryId { Category_Id: String; Category_Name: any; }

export interface ProfilePage { UserId: String; Other: String; }

export interface TopicQuestions { TopicId: String; Other: String; }

export interface SocialLoginRouting { Provider: String; Other: String; }

export interface SharePostRouting { PostId: String; PostType: String; }

@Injectable()
export class DataSharedVarServiceService {


  StoreSingUpType: SingUpType = { Type: '', Values : '' };
  StoreReturnUrl: ReturnUrl = { Url : '', Id : '' };
  StoreActiveSinInsignUpTab: ActiveSinInsignUpTab = { ActiveTab : '', Email : '' };
  StoreProfilePage: ProfilePage = { UserId : '', Other : '' };
  StoreCategory_Id: CategoryId = { Category_Id : '', Category_Name : '' };
  StoreTopicQuestions: TopicQuestions = { TopicId : '', Other : '' };
  StoreSocialLoginRouting: SocialLoginRouting = { Provider : '', Other : '' };
  StoreSharePost: SharePostRouting = { PostId : '', PostType : '' };

  constructor() { }

  SetSingUpType(Type, Values = null) {this.StoreSingUpType.Type = Type; this.StoreSingUpType.Values = Values; }
  GetSingUpType() { return this.StoreSingUpType; }


  SetReturnUrl(Url, Id= null) {this.StoreReturnUrl.Url = Url; this.StoreReturnUrl.Id = Id; }
  GetReturnUrl() { return this.StoreReturnUrl; }


  SetActiveSinInsignUpTab(str, email= null) {this.StoreActiveSinInsignUpTab.ActiveTab = str; this.StoreActiveSinInsignUpTab.Email = email; }
  GetActiveSinInsignUpTab() { return this.StoreActiveSinInsignUpTab; }


  SetProfilePage(UserId, Other= null) {this.StoreProfilePage.UserId = UserId; this.StoreProfilePage.Other = Other; }
  GetProfilePage() { return this.StoreProfilePage; }



  SetCategory_Id(Category_Id, Category_Name) {
    this.StoreCategory_Id.Category_Id = Category_Id; this.StoreCategory_Id.Category_Name = Category_Name; }
  GetCategory_Id() { return this.StoreCategory_Id; }



  SetTopicQuestions(TopicId, Other= null) {this.StoreTopicQuestions.TopicId = TopicId; this.StoreTopicQuestions.Other = Other; }
  GetTopicQuestions() { return this.StoreTopicQuestions; }



  SetSocialLoginRouting(Provider, Other= null) {
    this.StoreSocialLoginRouting.Provider = Provider; this.StoreSocialLoginRouting.Other = Other;
  }
  GetSocialLoginRouting() { return this.StoreSocialLoginRouting; }




  SetSharePost(PostId, PostType) {
    this.StoreSharePost.PostId = PostId; this.StoreSharePost.PostType = PostType;
  }
  GetSharePost() { return this.StoreSharePost; }




}
